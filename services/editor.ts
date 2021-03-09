import { HighlightSpecification } from "./common/types";

// Cut the given VODs into a highlight video according to the given hightlight specification.
const createHighlightVideo = (vodFolder: string, hightlightSpecifications: HighlightSpecification[]): void => {
    console.log(vodFolder, hightlightSpecifications);
};

export { createHighlightVideo };