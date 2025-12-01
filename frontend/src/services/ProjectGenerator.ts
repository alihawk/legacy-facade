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

export class ProjectGenerator {
  /**
   * Generate a complete React project as a ZIP file
   * 
   * @param schemas - Array of ResourceSchema objects from API analysis
   * @param baseUrl - Base URL for the API (e.g., "http://localhost:8000")
   * @returns Promise<Blob> - ZIP file blob ready for download
   */
  async generate(schemas: ResourceSchema[], baseUrl: string = 'http://localhost:8000'): Promise<Blob> {
    const zip = new JSZip()

    try {
      // Root configuration files
      this.addRootFiles(zip)

      // Source directory structure
      this.addSourceFiles(zip, schemas, baseUrl)

      // UI components
      this.addUIComponents(zip)

      // Portal components
      this.addPortalComponents(zip)

      // Public assets
      this.addPublicAssets(zip)

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
   * Add root configuration files
   */
  private addRootFiles(zip: JSZip): void {
    zip.file('package.json', packageJsonTemplate)
    zip.file('vite.config.ts', viteConfigTemplate)
    zip.file('tailwind.config.js', tailwindConfigTemplate)
    zip.file('postcss.config.js', postcssConfigTemplate)
    zip.file('tsconfig.json', tsconfigTemplate)
    zip.file('tsconfig.app.json', tsconfigAppTemplate)
    zip.file('tsconfig.node.json', tsconfigNodeTemplate)
    zip.file('.gitignore', gitignoreTemplate)
    zip.file('.env.example', envExampleTemplate)
    zip.file('README.md', readmeTemplate)
  }

  /**
   * Add source files (main app, services, config, types)
   */
  private addSourceFiles(zip: JSZip, schemas: ResourceSchema[], baseUrl: string): void {
    // Main app files
    zip.file('src/App.tsx', appTsxTemplate(schemas))
    zip.file('src/main.tsx', mainTsxTemplate())
    zip.file('src/App.css', appCssTemplate())
    zip.file('src/index.css', indexCssTemplate)

    // Services
    zip.file('src/services/api.ts', apiServiceTemplate(baseUrl))

    // Configuration
    zip.file('src/config/resources.ts', resourcesConfigTemplate(schemas))

    // Types
    zip.file('src/types/index.ts', typesTemplate)

    // Utilities
    zip.file('src/lib/utils.ts', utilsTemplate)
  }

  /**
   * Add UI component templates
   */
  private addUIComponents(zip: JSZip): void {
    const uiPath = 'src/components/ui/'
    
    zip.file(`${uiPath}button.tsx`, buttonTemplate)
    zip.file(`${uiPath}card.tsx`, cardTemplate)
    zip.file(`${uiPath}input.tsx`, inputTemplate)
    zip.file(`${uiPath}badge.tsx`, badgeTemplate)
    zip.file(`${uiPath}table.tsx`, tableTemplate)
    zip.file(`${uiPath}dialog.tsx`, dialogTemplate)
    zip.file(`${uiPath}select.tsx`, selectTemplate)
  }

  /**
   * Add portal component templates
   */
  private addPortalComponents(zip: JSZip): void {
    const componentsPath = 'src/components/'
    
    zip.file(`${componentsPath}Sidebar.tsx`, sidebarTemplate())
    zip.file(`${componentsPath}Dashboard.tsx`, dashboardTemplate())
    zip.file(`${componentsPath}ResourceList.tsx`, resourceListTemplate())
    zip.file(`${componentsPath}ResourceDetail.tsx`, resourceDetailTemplate())
    zip.file(`${componentsPath}ResourceForm.tsx`, resourceFormTemplate())
  }

  /**
   * Add public assets
   */
  private addPublicAssets(zip: JSZip): void {
    // Add a simple SVG logo
    const viteSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>`
    
    zip.file('public/vite.svg', viteSvg)
    
    // Add index.html
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
    
    zip.file('index.html', indexHtml)
  }
}

// Export singleton instance
export const projectGenerator = new ProjectGenerator()

export default projectGenerator
