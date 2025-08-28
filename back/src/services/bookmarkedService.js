import { prisma } from "../configs/database.js";

export class BookmarkedService {
  async listItems(userId, type = null) {
    let select;

    if (type) {
      select = { [type]: true };
    } else {
      select = { movies: true, series: true };
    }
    const result = await prisma.user.findUnique({
      where: { id: userId },
      select,
    });
    return type ? result[type] : result;
  }

  async addItem(userId, itemId, type) {
    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        [type]: {
          push: itemId,
        },
      },
    });

    return result[type];
  }

  async removeItem(userId, itemId, type) {
    const items = await this.listItems(userId);
    const updatedItems = items[type].filter((item) => item !== itemId);

    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        [type]: {
          set: updatedItems,
        },
      },
    });

    return result[type];
  }
}
