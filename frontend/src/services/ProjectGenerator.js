/**
 * ProjectGenerator - Generates a complete React project as a ZIP file
 *
 * Takes ResourceSchema[] and baseUrl, generates all project files,
 * and returns a downloadable ZIP blob.
 */
import JSZip from 'jszip';
// Import all templates
import { 
// Config templates
packageJsonTemplate, viteConfigTemplate, tailwindConfigTemplate, postcssConfigTemplate, tsconfigTemplate, tsconfigAppTemplate, tsconfigNodeTemplate, gitignoreTemplate, envExampleTemplate, 
// Base templates
readmeTemplate, indexCssTemplate, utilsTemplate, typesTemplate, 
// UI component templates
buttonTemplate, cardTemplate, inputTemplate, badgeTemplate, tableTemplate, dialogTemplate, selectTemplate, 
// Enhanced UI components
statsCardTemplate, simpleBarChartTemplate, recentActivityTemplate, bulkActionsBarTemplate, confirmDialogTemplate, fieldRendererTemplate, 
// Utility templates
csvExportTemplate, 
// Portal templates
appTsxTemplate, mainTsxTemplate, appCssTemplate, apiServiceTemplate, resourcesConfigTemplate, sidebarTemplate, dashboardTemplate, resourceListTemplate, resourceDetailTemplate, resourceFormTemplate, } from './templates';
// Import proxy templates
import { generateProxyConfig } from './templates/proxy/configGenerator';
import { generateProxyPackageJson, generateProxyTsConfig, generateProxyIndexTemplate, generateProxyRouterTemplate } from './templates/proxy/proxyServerTemplates';
import { generateFieldMapper } from './templates/proxy/fieldMapperTemplate';
import { generateAuthBuilder } from './templates/proxy/authBuilderTemplate';
import { generateSoapBuilder } from './templates/proxy/soapBuilderTemplate';
import { generateConfigLoader } from './templates/proxy/configLoaderTemplate';
import { startShTemplate, startBatTemplate } from './templates/proxy/startupScriptsTemplate';
export class ProjectGenerator {
    /**
     * Generate a complete React project as a ZIP file
     *
     * @param schemas - Array of ResourceSchema objects from API analysis
     * @param baseUrl - Base URL for the API (e.g., "http://localhost:8000")
     * @param proxyConfig - Optional proxy configuration from backend
     * @param customization - Optional UI customization settings
     * @returns Promise<Blob> - ZIP file blob ready for download
     */
    async generate(schemas, baseUrl = 'http://localhost:8000', proxyConfig, customization) {
        const zip = new JSZip();
        try {
            // Add README at root
            zip.file('README.md', readmeTemplate);
            // Add startup scripts at root
            zip.file('start.sh', startShTemplate());
            zip.file('start.bat', startBatTemplate());
            // Frontend files in frontend/ subdirectory
            this.addFrontendFiles(zip, schemas, baseUrl);
            // Proxy server files in proxy-server/ subdirectory
            this.addProxyServerFiles(zip, proxyConfig, schemas, baseUrl);
            // Generate the ZIP blob
            const blob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 6
                }
            });
            return blob;
        }
        catch (error) {
            console.error('Failed to generate project:', error);
            throw new Error(`Project generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Add all frontend files to the ZIP
     */
    addFrontendFiles(zip, schemas, baseUrl) {
        const frontend = zip.folder('frontend');
        // Root configuration files
        frontend.file('package.json', packageJsonTemplate);
        frontend.file('vite.config.ts', viteConfigTemplate);
        frontend.file('tailwind.config.js', tailwindConfigTemplate);
        frontend.file('postcss.config.js', postcssConfigTemplate);
        frontend.file('tsconfig.json', tsconfigTemplate);
        frontend.file('tsconfig.app.json', tsconfigAppTemplate);
        frontend.file('tsconfig.node.json', tsconfigNodeTemplate);
        frontend.file('.gitignore', gitignoreTemplate);
        frontend.file('.env.example', envExampleTemplate);
        // Source files
        frontend.file('src/App.tsx', appTsxTemplate(schemas));
        frontend.file('src/main.tsx', mainTsxTemplate());
        frontend.file('src/App.css', appCssTemplate());
        frontend.file('src/index.css', indexCssTemplate);
        // Services
        frontend.file('src/services/api.ts', apiServiceTemplate(baseUrl));
        // Configuration
        frontend.file('src/config/resources.ts', resourcesConfigTemplate(schemas));
        // Types
        frontend.file('src/types/index.ts', typesTemplate);
        // Utilities
        frontend.file('src/lib/utils.ts', utilsTemplate);
        // UI components
        const uiPath = 'src/components/ui/';
        frontend.file(`${uiPath}button.tsx`, buttonTemplate);
        frontend.file(`${uiPath}card.tsx`, cardTemplate);
        frontend.file(`${uiPath}input.tsx`, inputTemplate);
        frontend.file(`${uiPath}badge.tsx`, badgeTemplate);
        frontend.file(`${uiPath}table.tsx`, tableTemplate);
        frontend.file(`${uiPath}dialog.tsx`, dialogTemplate);
        frontend.file(`${uiPath}select.tsx`, selectTemplate);
        // Portal components
        const componentsPath = 'src/components/';
        frontend.file(`${componentsPath}Sidebar.tsx`, sidebarTemplate());
        frontend.file(`${componentsPath}Dashboard.tsx`, dashboardTemplate());
        frontend.file(`${componentsPath}ResourceList.tsx`, resourceListTemplate());
        frontend.file(`${componentsPath}ResourceDetail.tsx`, resourceDetailTemplate());
        frontend.file(`${componentsPath}ResourceForm.tsx`, resourceFormTemplate());
        // Enhanced UI components
        frontend.file(`${componentsPath}StatsCard.tsx`, statsCardTemplate());
        frontend.file(`${componentsPath}SimpleBarChart.tsx`, simpleBarChartTemplate());
        frontend.file(`${componentsPath}RecentActivity.tsx`, recentActivityTemplate());
        frontend.file(`${componentsPath}BulkActionsBar.tsx`, bulkActionsBarTemplate());
        frontend.file(`${componentsPath}ConfirmDialog.tsx`, confirmDialogTemplate());
        frontend.file(`${componentsPath}FieldRenderer.tsx`, fieldRendererTemplate());
        // Utilities
        frontend.file('src/utils/csvExport.ts', csvExportTemplate());
        // Public assets - Custom Admin Portal favicon (dashboard icon)
        const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="7" height="9" x="3" y="3" rx="1"/>
  <rect width="7" height="5" x="14" y="3" rx="1"/>
  <rect width="7" height="9" x="14" y="12" rx="1"/>
  <rect width="7" height="5" x="3" y="16" rx="1"/>
</svg>`;
        frontend.file('public/favicon.svg', faviconSvg);
        const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Modern Admin Portal - Generated by Legacy UX Reviver" />
    <title>Admin Portal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
        frontend.file('index.html', indexHtml);
    }
    /**
     * Add proxy server files to the ZIP
     */
    addProxyServerFiles(zip, proxyConfig, schemas, baseUrl) {
        const proxy = zip.folder('proxy-server');
        // Package.json and tsconfig
        proxy.file('package.json', generateProxyPackageJson());
        proxy.file('tsconfig.json', generateProxyTsConfig());
        // Source files
        proxy.file('src/index.ts', generateProxyIndexTemplate());
        proxy.file('src/proxy.ts', generateProxyRouterTemplate());
        proxy.file('src/fieldMapper.ts', generateFieldMapper());
        proxy.file('src/authBuilder.ts', generateAuthBuilder());
        proxy.file('src/soapBuilder.ts', generateSoapBuilder());
        proxy.file('src/config.ts', generateConfigLoader());
        // Generate config.json - pass baseUrl as fallback (e.g., from OpenAPI spec)
        const configJson = generateProxyConfig(proxyConfig || null, schemas, baseUrl);
        proxy.file('config.json', configJson);
    }
}
// Export singleton instance
export const projectGenerator = new ProjectGenerator();
export default projectGenerator;
