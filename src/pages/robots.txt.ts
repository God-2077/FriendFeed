import { robotsConfig } from '@config/config';



export async function GET() {
  const robotsContent = robotsConfig.robots
    .map((rule) => {
      let content = `User-agent: ${rule.userAgent}\n`;
      if (rule.allow) {
        rule.allow.forEach((path) => {
          content += `Allow: ${path}\n`;
        });
      }
      if (rule.disallow) {
        rule.disallow.forEach((path) => {
          content += `Disallow: ${path}\n`;
        });
      }
      if (rule.Sitemap) {
        content += `Sitemap: ${rule.Sitemap}\n`;
      }
      return content;
    })
    .join('\n');

  return new Response(robotsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}