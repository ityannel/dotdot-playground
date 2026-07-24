const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const { mdToPdf } = require('md-to-pdf');
    console.log('Starting mdToPdf conversion...');
    const pdf = await mdToPdf(
      { path: path.join(__dirname, 'poppop_specification.md') },
      {
        stylesheet: [path.join(__dirname, 'custom.css')],
        launch_options: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
      }
    );
    if (pdf && pdf.content) {
      const outputPath = path.join(__dirname, 'poppop_specification.pdf');
      fs.writeFileSync(outputPath, pdf.content);
      console.log('Successfully wrote PDF to:', outputPath, 'Bytes:', pdf.content.length);
    } else {
      console.error('mdToPdf returned empty content:', pdf);
    }
  } catch (err) {
    console.error('Error in convert_pdf:', err);
  }
}

main();
