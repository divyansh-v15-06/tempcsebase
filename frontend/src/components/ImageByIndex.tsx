import image1 from "../../public/17072126181122.jpg";
import image2 from "../../public/17059155995973.jpg";
import image3 from "../../public/17065024504226.jpg";
import image4 from "../../public/17059155995973.jpg";

export const images = [image1, image2, image3, image4];

const imageByIndex = (index: number) => images[index % images.length];

export default imageByIndex;
