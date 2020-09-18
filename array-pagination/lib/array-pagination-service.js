class ArrayPaginationService {

  static pages(items, page = 1, per_page = 50) {

    if (!Array.isArray(items)) {
      return { "message": "items provided is not an Array" };
    }
    const offset = (page - 1) * per_page;

    const paginated_items = items.slice(offset).slice(0, per_page);
    const total_pages = Math.ceil(items.length / per_page);

    return {
      page,
      per_page,
      "pre_page": page - 1 ? page - 1 : null,
      "next_page": total_pages > page ? page + 1 : null,
      "total": items.length,
      total_pages,
      "data": paginated_items
    };
  }
}
module.exports = ArrayPaginationService;