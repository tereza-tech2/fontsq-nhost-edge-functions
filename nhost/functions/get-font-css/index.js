import { nhost } from '../../nhost-client';

export default async (req, res) => {
  try {
    const { familyId } = req.query;

    const css = await nhost.graphql.request(`
      query {
        font_family_css(where: { family_id: { _eq: "${familyId}" } }) {
          css_content
          file_key
        }
      }
    `);

    res.status(200).json({
      cssContent: css.font_family_css[0]?.css_content || '',
      fileKey: css.font_family_css[0]?.file_key || ''
    });
  } catch (error) {
    console.error('Chyba při získávání CSS:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
