import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../config/db';

// Get list of all stores with average ratings and current user's submitted rating
export const getStoresList = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { search } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const whereClause: any = {
      role: 'STORE_OWNER',
    };

    if (search) {
      const searchStr = String(search);
      whereClause.OR = [
        { name: { contains: searchStr} },
        { address: { contains: searchStr } },
      ];
    }

    const stores = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        address: true,
        ratingsReceived: {
          select: {
            value: true,
            userId: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formattedStores = stores.map((store) => {
      const ratings = store.ratingsReceived.map((r) => r.value);
      const averageRating =
        ratings.length > 0
          ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
          : 0.0;

      const userRating = store.ratingsReceived.find((r) => r.userId === userId)?.value || 0;

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        rating: averageRating,
        userRating: userRating,
      };
    });

    return res.status(200).json({ stores: formattedStores });
  } catch (error) {
    console.error('Fetch stores list error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Submit or update a rating for a store
export const submitRating = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { storeOwnerId, value } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const ratingValue = Number(value);
  if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    return res.status(400).json({ message: 'Rating value must be an integer between 1 and 5.' });
  }

  try {
    // Verify target store owner exists
    const storeOwner = await prisma.user.findFirst({
      where: { id: storeOwnerId, role: 'STORE_OWNER' },
    });

    if (!storeOwner) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Upsert the rating
    const rating = await prisma.rating.upsert({
      where: {
        userId_storeOwnerId: {
          userId,
          storeOwnerId,
        },
      },
      update: {
        value: ratingValue,
      },
      create: {
        value: ratingValue,
        userId,
        storeOwnerId,
      },
    });

    return res.status(200).json({
      message: 'Rating submitted successfully.',
      rating,
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
