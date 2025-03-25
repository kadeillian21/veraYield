# veraYield Project Guidelines

## Recent Fixes - March 2025
- Added missing `.env` file with database connection string
- Fixed postcss.config.mjs to use proper plugins (tailwindcss and autoprefixer)
- Updated dependencies with html2canvas, jspdf, and react-icons
- Fixed component import issues using consistent DealData type
- Updated BRRRRCalculator to use localStorage instead of API calls
- Added prisma schema for future database integration

## Commands
- `npm run dev` - Start development server with turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (add to package.json: `"test": "vitest"`)
- `npm run test path/to/file.test.ts` - Run single test file

## Code Style
- **Components**: PascalCase, function components with TS return types
- **TypeScript**: Explicit interfaces for props, descriptive type names
- **Imports**: React first, then libraries, then local components, utilities last
- **Naming**: Clear, descriptive names reflecting purpose
- **Formatting**: 2-space indent, semicolons, single quotes
- **State**: Component state with useState, careful updates for nested objects
- **Error Handling**: Try/catch with specific error messages, console.error for logging

## Testing
- BDD style with nested describe/it blocks
- Test numerical calculations with toBeCloseTo
- Use it.only() or describe.only() for running specific tests
- Comprehensive test data for financial calculation verification