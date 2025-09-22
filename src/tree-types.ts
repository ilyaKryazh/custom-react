export type vNode = {
  type: string | Function;
  props: HTMLprop | null;
  childrens?: (string | vNode)[];
};

export type HTMLprop = {
  [s: string]: string | number | boolean;
};
