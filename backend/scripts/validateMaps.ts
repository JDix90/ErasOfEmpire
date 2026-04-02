/**
 * Validates all JSON maps under database/maps (bidirectional connections, known territories).
 * Run: pnpm run validate:maps (from backend/)
 */
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { validateMapConnections, type MapDocumentLike } from '../src/game-engine/validation/mapConnections';

async function main(): Promise<void> {
  const mapsDir = join(__dirname, '../../database/maps');
  const files = (await readdir(mapsDir)).filter((f) => f.endsWith('.json'));
  let failed = false;

  for (const file of files.sort()) {
    const raw = await readFile(join(mapsDir, file), 'utf-8');
    const map = JSON.parse(raw) as MapDocumentLike;
    const errors = validateMapConnections(map);
    if (errors.length > 0) {
      failed = true;
      console.error(`\n✗ ${file} (${map.map_id ?? '?'})`);
      for (const e of errors) console.error(`   - ${e}`);
    } else {
      console.log(`✓ ${file}`);
    }
  }

  if (failed) {
    console.error('\nMap validation failed.');
    process.exit(1);
  }
  console.log(`\nAll ${files.length} map file(s) passed connection validation.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
