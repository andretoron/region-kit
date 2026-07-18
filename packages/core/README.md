# region-kit

A framework-agnostic Node.js library for working with administrative region
datasets.

The current public API provides the Region-Kit Dataset Contract, structured
validation errors, and `validateRegionDataset()` for validating unknown input.

```ts
import { DatasetValidationError, validateRegionDataset } from "region-kit";

function validateJsonDataset(jsonText: string): void {
  const input: unknown = JSON.parse(jsonText);

  try {
    const dataset = validateRegionDataset(input);

    console.log(dataset.country.name);
  } catch (error) {
    if (error instanceof DatasetValidationError) {
      for (const issue of error.issues) {
        console.error(issue.code, issue.path, issue.message);
      }
    } else {
      throw error;
    }
  }
}
```

The validator returns the original input after structural, schema compatibility,
and hierarchy validation succeed. It does not normalize, copy, or freeze the
dataset.
