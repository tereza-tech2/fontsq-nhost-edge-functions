import { nhost } from '../../nhost-client';

export default async (req, res) => {
  try {
    const { familyId } = req.body;

    const fonts = await nhost.graphql.request(`
      query {
        fonts(where: { family_id: { _eq: "${familyId}" } }) {
          file_key
          properties
        }
      }
    `);

    let cssContent = '';
    fonts.fonts.forEach(font => {
      const familyName = font.properties.family || 'Unnamed';
      cssContent += `
@font-face {
  font-family: "${familyName}";
  src: url('${font.file_key}') format('truetype');
  font-weight: ${font.properties.weight || 400};
  font-style: ${font.properties.style || 'normal'};
  font-stretch: ${font.properties.stretch || 'normal'};
}
      `;
    });

    const cssFileKey = `css/${familyId}-font.css`;
    await nhost.storage.upload(`public/${cssFileKey}`, Buffer.from(cssContent));

    await nhost.graphql.request(`
      mutation {
        insert_font_family_css_one(object: {
          family_id: "${familyId}",
          css_content: "${cssContent.replace(/'/g, "\\'")}",
          file_key: "${cssFileKey}"
        }) {
          id
        }
      }
    `);

    res.status(200).json({
      status: 'success',
      cssContent,
      fileKey: cssFileKey
    });
  } catch (error) {
    console.error('Chyba při generování CSS:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
