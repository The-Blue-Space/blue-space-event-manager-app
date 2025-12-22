// Re-export from new-package schema since they share the same structure
export { newPackageSchema as editPackageSchema, newPackageInitial as editPackageInitial, formSchemaFieldSchema, emptyFormField } from "../new-package/schema";
export type { NewPackageFormData as EditPackageFormData } from "../new-package/schema";
