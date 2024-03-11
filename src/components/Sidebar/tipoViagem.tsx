import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
// import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

const TipoViagem = () => {
  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

  const [state, setState] = React.useState({
    programada: true,
    FF_Azul: false,
    GC_Grey: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [event.target.name]: event.target.checked,
    });
  };

  const { programada, FF_Azul, GC_Grey } = state;

  return (
    <>
      <Box sx={{ display: 'flex', marginTop: -5 }}>
        <FormControl sx={{ m: 1 }} component="fieldset" variant="standard">
          {/* <FormLabel component="legend">Assign responsibility</FormLabel> */}
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  {...label}
                  // defaultChecked
                  color="secondary"
                  checked={programada}
                  onChange={handleChange}
                  name="programada"
                />
              }
              label="Programada"
            />
            <FormControlLabel
              control={
                <Checkbox
                  {...label}
                  // defaultChecked
                  color="success"
                  checked={FF_Azul}
                  onChange={handleChange}
                  name="FF_Azul"
                />
              }
              label="FF Azul"
            />
            <FormControlLabel
              control={
                <Checkbox
                  {...label}
                  // defaultChecked
                  color="default"
                  checked={GC_Grey}
                  onChange={handleChange}
                  name="GC_Grey"
                />
              }
              label="GC Grey"
            />
          </FormGroup>
          {/* <FormHelperText>Be careful</FormHelperText> */}
        </FormControl>
      </Box>
    </>
  );
};
export default TipoViagem;
