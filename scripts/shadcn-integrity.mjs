import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = path.join(root, "shadcn-originals.json");
const directory = path.join(root, "src/shared/ui");
const record = process.argv.includes("--record");
const manifest = await readFile(manifestPath, "utf8")
  .then(JSON.parse)
  .catch((error) => {
    if (error.code === "ENOENT" && record) return {};
    throw error;
  });
const files = (await readdir(directory, { recursive: true }))
  .filter((file) => /\.[jt]sx?$/.test(file))
  .sort();

if (files.length === 0) throw new Error("shadcn 생성 파일이 없습니다.");

const current = {};
for (const file of files) {
  current[file] = createHash("sha256")
    .update(await readFile(path.join(directory, file)))
    .digest("hex");
}

for (const [file, digest] of Object.entries(manifest)) {
  if (current[file] !== digest) {
    throw new Error(
      `shadcn 원본이 바뀌거나 삭제됐습니다: ${file}. 사용자 수정 요청을 확인하십시오.`,
    );
  }
}

const added = files.filter((file) => !(file in manifest));
if (added.length && !record) {
  throw new Error(`새 생성 파일을 vp run ui:record로 등록하십시오: ${added.join(", ")}`);
}
if (record) await writeFile(manifestPath, JSON.stringify(current, null, 2) + "\n");

console.log(`shadcn 원본 ${files.length}개 확인${record ? `, 신규 ${added.length}개 등록` : ""}`);
