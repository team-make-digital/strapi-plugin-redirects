import { Main } from '@strapi/design-system';
import { useIntl } from 'react-intl';

import { getTranslation } from '../utils/getTranslation';
import RedirectSettings from './Settings';

const HomePage = () => {
  const { formatMessage } = useIntl();

  return (
    <Main>
      <RedirectSettings/>
    </Main>
  );
};

export { HomePage };
