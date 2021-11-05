export const getCategories = () => ['Общая информация', 'Языковой материал', 'Письмо'];

export const getCategorySlug = (category) => {
    const slugs = ['general', 'uoe', 'writing'];
    const index = getCategories().indexOf(category);
    if (index === -1) return null;
    return slugs[index];
};
