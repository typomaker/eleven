import React from "react"
import AvatarBase, { AvatarProps } from "@material-ui/core/Avatar"

export const Avatar: React.FunctionComponent<Avatar.Props> = (props) => {
  return <AvatarBase {...props} variant={'rounded'} />
}
export namespace Avatar {
  export type Props = Omit<AvatarProps, 'variant'>;
}
export default Avatar;