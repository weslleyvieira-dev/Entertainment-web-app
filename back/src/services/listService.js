import { prisma } from "../configs/database.js";

export class ListService {
  async getUserLists(userId) {
    const result = await prisma.list.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        name: true,
        slug: true,
        movies: true,
        series: true,
      },
    });

    return result;
  }

  async getList(listId, userId) {
    const result = await prisma.list.findFirst({
      where: { id: listId, userId: userId },
      select: {
        id: true,
        userId: true,
        name: true,
        slug: true,
        movies: true,
        series: true,
      },
    });

    return result;
  }

  async createList(userId, name, slug) {
    const result = await prisma.list.create({
      data: {
        userId,
        name,
        slug,
        movies: [],
        series: [],
      },
    });

    return result;
  }

  async deleteList(listId) {
    const result = await prisma.list.delete({
      where: {
        id: listId,
      },
    });

    return result;
  }

  async addItem(currentList, item) {
    const id = currentList.id;
    const { itemId, type } = item;

    const result = await prisma.list.update({
      where: { id },
      data: {
        [type]: {
          push: itemId,
        },
      },
      select: {
        [type]: true,
      },
    });

    return result;
  }

  async removeItem(currentList, item) {
    const { id } = currentList;
    const { itemId, type } = item;
    const value = Number(itemId);
    const currentItems = currentList[type];
    const updatedItems = currentItems.filter((v) => v !== value);

    const result = await prisma.list.update({
      where: { id },
      data: {
        [type]: { set: updatedItems },
      },
      select: {
        [type]: true,
      },
    });

    return result;
  }
}
