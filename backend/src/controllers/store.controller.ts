import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/db';

export const getStoreDashboard = async (req: AuthenticatedRequest, res: Response) => {
  const storeOwnerId = req.user?.id;

  if (!storeOwnerId) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = req.query.sort;

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'rating') {
    orderBy = { value: 'desc' };
  } else if (sort === 'latest') {
    orderBy = { createdAt: 'desc' };
  }

  try {
    const [ratings, stats] = await Promise.all([
      prisma.rating.findMany({
        where: { storeOwnerId },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy,
        take: limit,
        skip,
      }),

      prisma.rating.aggregate({
        where: { storeOwnerId },
        _avg: { value: true },
        _count: { value: true },
      }),
    ]);

    const averageRating = Number((stats._avg.value || 0).toFixed(2));
    const totalRatings = stats._count.value;

    const reviews = ratings.map((r) => ({
      id: r.id,
      name: r.user.name,
      email: r.user.email,
      rating: r.value,
      date: r.createdAt,
    }));

    return res.status(200).json({
      averageRating,
      totalRatings,
      customers: reviews,
      pagination: {
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Fetch store dashboard error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};