/**
 * Template exports for project generation
 *
 * This module exports all template strings used to generate
 * a complete React + Vite + TypeScript project.
 */
// Configuration templates
export { packageJsonTemplate, viteConfigTemplate, tailwindConfigTemplate, postcssConfigTemplate, tsconfigTemplate, tsconfigAppTemplate, tsconfigNodeTemplate, gitignoreTemplate, envExampleTemplate, } from './configTemplates';
// Base project templates
export { readmeTemplate, indexCssTemplate, utilsTemplate, typesTemplate, } from './baseTemplates';
// UI component templates
export { buttonTemplate, cardTemplate, inputTemplate, badgeTemplate, tableTemplate, dialogTemplate, selectTemplate, 
// Enhanced UI components
statsCardTemplate, simpleBarChartTemplate, recentActivityTemplate, bulkActionsBarTemplate, confirmDialogTemplate, fieldRendererTemplate, } from './components';
// Utility templates
export { csvExportTemplate, } from './utils';
// Portal component templates
export { appTsxTemplate, mainTsxTemplate, appCssTemplate, apiServiceTemplate, resourcesConfigTemplate, sidebarTemplate, dashboardTemplate, resourceListTemplate, resourceDetailTemplate, resourceFormTemplate, } from './portal';
