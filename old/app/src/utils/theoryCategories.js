const GENERAL = 'Общая информация';
const UOE = 'Языковой материал';
const WRITING = 'Письмо';

export const getCategories = () => [GENERAL, UOE, WRITING];

export const getCategorySlug = (category) => ({[GENERAL]: 'general', [UOE]: 'uoe', [WRITING]: 'writing'}[category]);

export const getCategoryName = (slug) => ({'general': GENERAL, 'uoe': UOE, 'writing': WRITING}[slug]);
