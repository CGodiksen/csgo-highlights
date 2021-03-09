import { Highlight } from "./common/types";

// Cut the given VODs into a highlight video according to the given hightlight specification.
const createHighlightVideo = (vodFolder: string, highlights: Highlight[]): void => {
    console.log(vodFolder, highlights);
};

export { createHighlightVideo };