import { createContext } from 'react';

export const DrawerContext = createContext({ openDrawer: () => {}, closeDrawer: () => {} });
