import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/db';
import * as bcrypt from 'bcryptjs';

// Helper function to build search filter case-insensitively depending on DB provider
const getSearchFilter = (value: any) => {
  const isMysql = process.env.DATABASE_URL?.includes('mysql') || false;
  if (isMysql) {
    return { contains: String(value) };
  }
  return { contains: String(value), mode: 'insensitive' as const };
};

// -------------------- GET STATS --------------------
export const getStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count({
      where: { role: { in: ['NORMAL_USER', 'ADMIN'] } },
    });

    const totalStores = await prisma.user.count({
      where: { role: 'STORE_OWNER' },
    });

    const totalRatings = await prisma.rating.count();

    return res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// -------------------- GET USERS --------------------
export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, address, role, sortBy, order } = req.query;

  // Safe pagination params parsing (prevents NaN)
  const pageQuery = req.query.page ? Number(req.query.page) : 1;
  const limitQuery = req.query.limit ? Number(req.query.limit) : 10;
  const page = Math.max(1, isNaN(pageQuery) ? 1 : pageQuery);
  const limit = Math.max(1, Math.min(100, isNaN(limitQuery) ? 10 : limitQuery));
  const skip = (page - 1) * limit;

  try {
    const whereClause: any = {
      role: { in: ['NORMAL_USER', 'ADMIN'] },
    };

    if (name) whereClause.name = getSearchFilter(name);
    if (email) whereClause.email = getSearchFilter(email);
    if (address) whereClause.address = getSearchFilter(address);

    if (role && ['NORMAL_USER', 'ADMIN'].includes(String(role))) {
      whereClause.role = role;
    }

    // Safe sorting fields
    const allowedSortFields = ['name', 'email', 'address', 'createdAt'];
    const sortField = allowedSortFields.includes(String(sortBy))
      ? String(sortBy)
      : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const [users, totalItems] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          [sortField]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return res.status(200).json({
      users,
      totalItems,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// -------------------- GET STORES --------------------
export const getStores = async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, address, sortBy, order } = req.query;

  // Safe pagination params parsing (prevents NaN)
  const pageQuery = req.query.page ? Number(req.query.page) : 1;
  const limitQuery = req.query.limit ? Number(req.query.limit) : 10;
  const page = Math.max(1, isNaN(pageQuery) ? 1 : pageQuery);
  const limit = Math.max(1, Math.min(100, isNaN(limitQuery) ? 10 : limitQuery));
  const skip = (page - 1) * limit;

  const isRatingSort = String(sortBy) === 'rating';
  const sortOrder = order === 'asc' ? 'asc' : 'desc';

  try {
    let formattedStores: any[];
    let totalItems: number;

    if (isRatingSort) {
      // --- Rating sort: raw SQL so AVG() is computed at DB level BEFORE pagination ---
      const conditions: string[] = [`u.role = 'STORE_OWNER'`];
      const bindings: any[] = [];

      if (name) {
        conditions.push(`LOWER(u.name) LIKE LOWER(?)`);
        bindings.push(`%${String(name)}%`);
      }
      if (email) {
        conditions.push(`LOWER(u.email) LIKE LOWER(?)`);
        bindings.push(`%${String(email)}%`);
      }
      if (address) {
        conditions.push(`LOWER(u.address) LIKE LOWER(?)`);
        bindings.push(`%${String(address)}%`);
      }

      const whereSQL = conditions.join(' AND ');
      const orderSQL = sortOrder === 'asc' ? 'ASC' : 'DESC';

      // Count total matching rows
      const countResult = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
        `SELECT COUNT(DISTINCT u.id) AS total FROM User u WHERE ${whereSQL}`,
        ...bindings
      );
      totalItems = Number(countResult[0]?.total ?? 0);

      // Fetch sorted + paginated results with AVG rating computed at DB level
      const rawStores = await prisma.$queryRawUnsafe<
        {
          id: string;
          name: string;
          email: string;
          address: string;
          role: string;
          createdAt: Date;
          avgRating: number | null;
        }[]
      >(
        `SELECT u.id, u.name, u.email, u.address, u.role, u.createdAt,
                COALESCE(AVG(r.value), 0) AS avgRating
         FROM User u
         LEFT JOIN Rating r ON r.storeOwnerId = u.id
         WHERE ${whereSQL}
         GROUP BY u.id, u.name, u.email, u.address, u.role, u.createdAt
         ORDER BY avgRating ${orderSQL}
         LIMIT ? OFFSET ?`,
        ...bindings,
        limit,
        skip
      );

      formattedStores = rawStores.map((store) => ({
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        role: store.role,
        createdAt: store.createdAt,
        rating: Number((store.avgRating ?? 0).toFixed(2)),
      }));
    } else {
      // --- Non-rating sort: standard Prisma findMany ---
      const whereClause: any = { role: 'STORE_OWNER' };
      if (name) whereClause.name = getSearchFilter(name);
      if (email) whereClause.email = getSearchFilter(email);
      if (address) whereClause.address = getSearchFilter(address);

      const allowedSortFields = ['name', 'email', 'address', 'createdAt'];
      const sortField = allowedSortFields.includes(String(sortBy)) ? String(sortBy) : 'createdAt';

      const [stores, count] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          include: { ratingsReceived: { select: { value: true } } },
          orderBy: { [sortField]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      totalItems = count;

      formattedStores = stores.map((store) => {
        const ratings = store.ratingsReceived.map((r) => r.value);
        const avg =
          ratings.length > 0
            ? Number((ratings.reduce((sum, val) => sum + val, 0) / ratings.length).toFixed(2))
            : 0;
        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          role: store.role,
          createdAt: store.createdAt,
          rating: avg,
        };
      });
    }

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return res.status(200).json({
      stores: formattedStores,
      totalItems,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('Fetch stores error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


// -------------------- GET USER BY ID --------------------
export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        ratingsReceived: {
          select: { value: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let averageRating: number | undefined;

    if (user.role === 'STORE_OWNER') {
      const ratings = user.ratingsReceived.map((r) => r.value);
      averageRating = ratings.length > 0
        ? Number((ratings.reduce((sum, val) => sum + val, 0) / ratings.length).toFixed(2))
        : 0;
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        rating: averageRating,
      },
    });
  } catch (error) {
    console.error('Fetch user detail error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// -------------------- CREATE USER --------------------
export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, address, role } = req.body;

  try {
    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: 'User created successfully.',
      user: newUser,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};