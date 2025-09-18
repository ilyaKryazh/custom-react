export type HTMLelement = {
  type: string;
  props: HTMLprop | null;
  childrens?: string | (string | HTMLelement)[];
};

export type HTMLprop = {
  [s: string]: string | number | boolean;
};
