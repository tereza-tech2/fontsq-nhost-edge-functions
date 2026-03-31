import { nhost } from '../../nhost-client';

export default async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Soubor nebyl nahran.' });
    }

    const { originalName, mimeType, size, properties } = req.body;
    const { buffer } = req.file;

    const fileKey = `fonts/${Date.now()}-${originalName}`;
    await nhost.storage.upload(`public/${fileKey}`, buffer);

    const familyName = properties.family || 'Unnamed';
    let family = await nhost.graphql.request(`
      query {
        font_families(where: { name: { _eq: "${familyName}" } }) {
          id
        }
      }
    `);

    let familyId;
    if (!family.font_families.length) {
      family = await nhost.graphql.request(`
        mutation {
          insert_font_families_one(object: { name: "${familyName}" }) {
            id
          }
        }
      `);
      familyId = family.insert_font_families_one.id;
    } else {
      familyId = family.font_families[0].id;
    }

    const font = await nhost.graphql.request(`
      mutation {
        insert_fonts_one(object: {
          family_id: "${familyId}",
          name: "${originalName}",
          file_key: "${fileKey}",
          properties: ${JSON.stringify(properties)}
        }) {
          id
        }
      }
    `);

    res.status(200).json({
      status: 'success',
      fontId: font.insert_fonts_one.id,
      familyId,
      fileKey
    });
  } catch (error) {
    console.error('Chyba při uploadu fontu:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
