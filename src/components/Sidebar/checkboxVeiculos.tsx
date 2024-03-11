import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
// import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

const CheckboxVeiculos = () => {
  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

  const [state, setState] = React.useState({
    DD_Trucado: true,
    FF_Azul: false,
    GC_Grey: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [event.target.name]: event.target.checked,
    });
  };

  const { DD_Trucado, FF_Azul, GC_Grey } = state;

  return (
    <>
      {/* <FormGroup>
        <Checkbox {...label} defaultChecked />

        <Checkbox {...label} defaultChecked color="secondary" />
        <Checkbox {...label} defaultChecked color="success" />
        <Checkbox {...label} defaultChecked color="default" />
      </FormGroup> */}
      {/* <Checkbox
          {...label}
          defaultChecked
          sx={{
            color: pink[800],
            '&.Mui-checked': {
              color: pink[600],
            },
          }}
        /> */}

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
                  checked={DD_Trucado}
                  onChange={handleChange}
                  name="DD_Trucado"
                />
              }
              label="DD Trucado"
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
export default CheckboxVeiculos;
