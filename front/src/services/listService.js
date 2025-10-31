import { backendApi } from "@/api/backendApi";

export default class ListService {
  async getUserLists() {
    const token = localStorage.getItem("accessToken");
    const response = await backendApi.get(`/me/lists`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const lists = response.data;
    const existingLists = JSON.parse(
      localStorage.getItem("userLists") || "null"
    );
    if (JSON.stringify(existingLists) !== JSON.stringify(lists)) {
      this.updateLocalStorage(lists);
    }
    return lists;
  }

  async getList(id) {
    const token = localStorage.getItem("accessToken");
    const response = await backendApi.get(`/me/lists/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return response.data;
  }

  async createList(name) {
    const token = localStorage.getItem("accessToken");
    const payload = { name };
    const response = await backendApi.post(`/me/lists`, payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }

  async deleteList(id) {
    const token = localStorage.getItem("accessToken");
    const response = await backendApi.delete(`/me/lists/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  async addItemToList(listId, item) {
    const token = localStorage.getItem("accessToken");
    const payload = {
      itemId: item.id,
      type: item.type,
    };

    const response = await backendApi.put(
      `/me/lists/${listId}/items`,
      payload,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );

    const updatedList = response.data;
    return updatedList;
  }

  async removeItemFromList(data) {
    const token = localStorage.getItem("accessToken");
    const { listId, type, itemId } = data;

    let response;

    try {
      response = await backendApi.delete(
        `/me/lists/${listId}/items/${type}/${itemId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      return error.response;
    }
    return response;
  }

  updateLocalStorage(lists) {
    try {
      localStorage.setItem("userLists", JSON.stringify(lists));
    } catch (e) {
      console.warn("Failed to save lists to localStorage", e);
    }
  }
}
