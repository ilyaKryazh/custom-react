export type HTMLelement = {
  type: string | Function;
  props: HTMLprop | null;
  childrens?: (string | HTMLelement)[];
};

export type HTMLprop = {
  [s: string]: string | number | boolean;
};
