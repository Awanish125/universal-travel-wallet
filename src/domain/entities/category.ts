export interface CategoryProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom: boolean;
  gradientRole?: string;
}

export class Category {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly color: string;
  readonly isCustom: boolean;
  readonly gradientRole?: string;

  constructor(props: CategoryProps) {
    this.id = props.id;
    this.name = props.name;
    this.icon = props.icon;
    this.color = props.color;
    this.isCustom = props.isCustom;
    this.gradientRole = props.gradientRole;
  }
}
