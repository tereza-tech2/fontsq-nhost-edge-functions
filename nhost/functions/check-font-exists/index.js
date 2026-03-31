import { nhost } from '../../nhost-client';

export default async (req, res) => {
  try {
    const { originalName, properties } = req.body;
    const familyName = properties.family || 'Unnamed';

    const response = await nhost.graphql.request(`
      query {
        fonts(where: {
          name: { _eq: "${originalName}" },
          family: { name: { _eq: "${familyName}" } }
        }) {
          id
          name
          properties
          file_key
        }
      }
    `);

    res.status(200).json({
      exists: response.fonts.length > 0,
      font: response.fonts[0] || null
    });
  } catch (error) {
    console.error('Chyba při kontrole fontu:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
