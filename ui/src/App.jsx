import { useState } from 'react'
import './App.css'
import Hud from './components/Hud'
import { createTheme, MantineProvider } from '@mantine/core';
import {emotionTransform, MantineEmotionProvider,} from '@mantine/emotion';
import { useConfig } from './providers/configprovider';
import ThemeProvider from './providers/themeprovider';
import HudPositionProvider from './providers/hudpositionprovider';

const theme = createTheme({
  primary: 'blue'
});

function App() {



  return (
    <div className="nox-hud-root">

    <MantineProvider theme={{...theme}}>
      <MantineEmotionProvider>
        <ThemeProvider>
          <HudPositionProvider>
            <Hud />
          </HudPositionProvider>
        </ThemeProvider>
      </MantineEmotionProvider>
    </MantineProvider>
    </div>
  )
}

export default App
