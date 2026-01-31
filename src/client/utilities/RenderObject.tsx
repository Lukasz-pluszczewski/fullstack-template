import { ObjectView } from 'react-object-view';

import './RenderObject.scss';

const options = {
  hideDataTypes: false,
  hideObjectSize: false,
  hidePreviews: false,
};
const palette = {};
const styles = {};

export const RenderObject = ({ data }: { data: any }) => {
  return (
    <ObjectView
      data={data}
      options={options}
      styles={styles}
      palette={palette}
    />
  );
};
