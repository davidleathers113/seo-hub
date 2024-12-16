export interface FormData {
  topic: string;
  keywords: string[];
  outline: {
    sections: {
      title: string;
      points: string[];
    }[];
  };
  content: string;
}
