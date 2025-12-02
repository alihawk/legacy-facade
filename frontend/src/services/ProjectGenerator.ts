/**
 * ProjectGenerator - Generates a complete React project as a ZIP file
 * 
 * Takes ResourceSchema[] and baseUrl, generates all project files,
 * and returns a downloadable ZIP blob.
 */

import JSZip from 'jszip'

// Import all templates
import {
  // Config templates
  packageJsonTemplate,
  viteConfigTemplate,
  tailwindConfigTemplate,
  postcssConfigTemplate,
  tsconfigTemplate,
  tsconfigAppTemplate,
  tsconfigNodeTemplate,
  gitignoreTemplate,
  envExampleTemplate,
  // Base templates
  readmeTemplate,
  indexCssTemplate,
  utilsTemplate,
  typesTemplate,
  // UI component templates
  buttonTemplate,
  cardTemplate,
  inputTemplate,
  badgeTemplate,
  tableTemplate,
  dialogTemplate,
  selectTemplate,
  // Enhanced UI components
  statsCardTemplate,
  simpleBarChartTemplate,
  recentActivityTemplate,
  bulkActionsBarTemplate,
  confirmDialogTemplate,
  fieldRendererTemplate,
  // Utility templates
  csvExportTemplate,
  // Portal templates
  appTsxTemplate,
  mainTsxTemplate,
  appCssTemplate,
  apiServiceTemplate,
  resourcesConfigTemplate,
  sidebarTemplate,
  dashboardTemplate,
  resourceListTemplate,
  resourceDetailTemplate,
  resourceFormTemplate,
} from './templates'

// Import proxy templates
import { generateProxyConfig } from './templates/proxy/configGenerator'
import { generateProxyPackageJson, generateProxyTsConfig, generateProxyIndexTemplate, generateProxyRouterTemplate } from './templates/proxy/proxyServerTemplates'
import { generateFieldMapper } from './templates/proxy/fieldMapperTemplate'
import { generateAuthBuilder } from './templates/proxy/authBuilderTemplate'
import { generateSoapBuilder } from './templates/proxy/soapBuilderTemplate'
import { generateConfigLoader } from './templates/proxy/configLoaderTemplate'
import { startShTemplate, startBatTemplate } from './templates/proxy/startupScriptsTemplate'

export interface ResourceField {
  name: string
  type: string
  displayName: string
}

export interface ResourceSchema {
  name: string
  displayName: string
  endpoint: string
  primaryKey: string
  fields: ResourceField[]
  operations: string[]
}

// ProxyConfig interface (matches backend)
export interface ProxyConfig {
  baseUrl: string
  apiType: 'rest' | 'soap'
  auth: any
  resources: any[]
  soapNamespace?: string
}

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
  async generate(
    schemas: ResourceSchema[], 
    baseUrl: string = 'http://localhost:8000',
    proxyConfig?: ProxyConfig | null,
    customization?: any
  ): Promise<Blob> {
    const zip = new JSZip()

    try {
      // Add README at root
      zip.file('README.md', readmeTemplate)

      // Add startup scripts at root
      zip.file('start.sh', startShTemplate())
      zip.file('start.bat', startBatTemplate())

      // Frontend files in frontend/ subdirectory
      this.addFrontendFiles(zip, schemas, baseUrl)

      // Proxy server files in proxy-server/ subdirectory
      this.addProxyServerFiles(zip, proxyConfig, schemas, baseUrl)

      // Generate the ZIP blob
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      })

      return blob
    } catch (error) {
      console.error('Failed to generate project:', error)
      throw new Error(`Project generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Add all frontend files to the ZIP
   */
  private addFrontendFiles(zip: JSZip, schemas: ResourceSchema[], baseUrl: string): void {
    const frontend = zip.folder('frontend')!

    // Root configuration files
    frontend.file('package.json', packageJsonTemplate)
    frontend.file('vite.config.ts', viteConfigTemplate)
    frontend.file('tailwind.config.js', tailwindConfigTemplate)
    frontend.file('postcss.config.js', postcssConfigTemplate)
    frontend.file('tsconfig.json', tsconfigTemplate)
    frontend.file('tsconfig.app.json', tsconfigAppTemplate)
    frontend.file('tsconfig.node.json', tsconfigNodeTemplate)
    frontend.file('.gitignore', gitignoreTemplate)
    frontend.file('.env.example', envExampleTemplate)

    // Source files
    frontend.file('src/App.tsx', appTsxTemplate(schemas))
    frontend.file('src/main.tsx', mainTsxTemplate())
    frontend.file('src/App.css', appCssTemplate())
    frontend.file('src/index.css', indexCssTemplate)

    // Services
    frontend.file('src/services/api.ts', apiServiceTemplate(baseUrl))

    // Configuration
    frontend.file('src/config/resources.ts', resourcesConfigTemplate(schemas))

    // Types
    frontend.file('src/types/index.ts', typesTemplate)

    // Utilities
    frontend.file('src/lib/utils.ts', utilsTemplate)

    // UI components
    const uiPath = 'src/components/ui/'
    frontend.file(`${uiPath}button.tsx`, buttonTemplate)
    frontend.file(`${uiPath}card.tsx`, cardTemplate)
    frontend.file(`${uiPath}input.tsx`, inputTemplate)
    frontend.file(`${uiPath}badge.tsx`, badgeTemplate)
    frontend.file(`${uiPath}table.tsx`, tableTemplate)
    frontend.file(`${uiPath}dialog.tsx`, dialogTemplate)
    frontend.file(`${uiPath}select.tsx`, selectTemplate)

    // Portal components
    const componentsPath = 'src/components/'
    frontend.file(`${componentsPath}Sidebar.tsx`, sidebarTemplate())
    frontend.file(`${componentsPath}Dashboard.tsx`, dashboardTemplate())
    frontend.file(`${componentsPath}ResourceList.tsx`, resourceListTemplate())
    frontend.file(`${componentsPath}ResourceDetail.tsx`, resourceDetailTemplate())
    frontend.file(`${componentsPath}ResourceForm.tsx`, resourceFormTemplate())
    
    // Enhanced UI components
    frontend.file(`${componentsPath}StatsCard.tsx`, statsCardTemplate())
    frontend.file(`${componentsPath}SimpleBarChart.tsx`, simpleBarChartTemplate())
    frontend.file(`${componentsPath}RecentActivity.tsx`, recentActivityTemplate())
    frontend.file(`${componentsPath}BulkActionsBar.tsx`, bulkActionsBarTemplate())
    frontend.file(`${componentsPath}ConfirmDialog.tsx`, confirmDialogTemplate())
    frontend.file(`${componentsPath}FieldRenderer.tsx`, fieldRendererTemplate())
    
    // Utilities
    frontend.file('src/utils/csvExport.ts', csvExportTemplate())

    // Public assets
    const viteSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>`
    frontend.file('public/vite.svg', viteSvg)

    const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin Portal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    frontend.file('index.html', indexHtml)
  }

  /**
   * Add proxy server files to the ZIP
   */
  private addProxyServerFiles(
    zip: JSZip, 
    proxyConfig: ProxyConfig | null | undefined,
    schemas: ResourceSchema[],
    baseUrl: string
  ): void {
    const proxy = zip.folder('proxy-server')!

    // Package.json and tsconfig
    proxy.file('package.json', generateProxyPackageJson())
    proxy.file('tsconfig.json', generateProxyTsConfig())

    // Source files
    proxy.file('src/index.ts', generateProxyIndexTemplate())
    proxy.file('src/proxy.ts', generateProxyRouterTemplate())
    proxy.file('src/fieldMapper.ts', generateFieldMapper())
    proxy.file('src/authBuilder.ts', generateAuthBuilder())
    proxy.file('src/soapBuilder.ts', generateSoapBuilder())
    proxy.file('src/config.ts', generateConfigLoader())

    // Generate config.json
    const configJson = generateProxyConfig(proxyConfig || null, schemas)
    proxy.file('config.json', configJson)
  }

}

// Export singleton instance
export const projectGenerator = new ProjectGenerator()

export default projectGenerator
