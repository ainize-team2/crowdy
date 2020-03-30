// core
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePosition } from 'use-position';

// material-ui
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import GitHubIcon from '@material-ui/icons/GitHub';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import WhereToVoteIcon from '@material-ui/icons/WhereToVote';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
        Crowdy
      {' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
}));

const getViewUrl = (location) => {
  return `https://maps.google.com/?q=${encodeURIComponent(location.address)}`;
}

const getDirectionsUrl = (location) => {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`;
}

export default function App() {
  const classes = useStyles();

  const [data, setData] = useState({ locations: [] });

  const { latitude, longitude } = usePosition(true);

  useEffect(() => {
    if (latitude && longitude) {
      const fetchData = () => {
        fetch(`/api/locations?category=Supermarket&latitude=${latitude}&longitude=${longitude}`)
          .then(res => res.json())
          .then(locations => setData(locations));
      };

      fetchData();
    }
  }, [latitude, longitude]);

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <PersonPinIcon className={classes.icon} />
          <Typography variant="h5" color="inherit" noWrap>
            Crowdy
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        {/* Hero unit */}
        <div className={classes.heroContent}>
          <Container maxWidth="sm">
            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
              Crowdy
            </Typography>
            <Typography variant="h5" align="center" color="textSecondary" paragraph>
              Find a supermarket near you that is not crowded!
              Based on popular times data from Google Maps
            </Typography>
            {/* <div className={classes.heroButtons}>
              <Grid container spacing={2} justify="center">
                <Grid item>
                  <Button variant="contained" color="primary">
                    Main call to action
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="outlined" color="primary">
                    Secondary action
                  </Button>
                </Grid>
              </Grid>
            </div> */}
          </Container>
        </div>
        <Container className={classes.cardGrid} maxWidth="md">
          {/* End hero unit */}
          <Grid container spacing={4}>
            {data.locations.map((location, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                  <CardContent className={classes.cardContent}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {location.name}
                    </Typography>
                    {location.live && <Chip color="secondary" style={{ fontWeight: "bold" }} icon={<WhereToVoteIcon />} label="LIVE" />}{' '}
                    <Chip style={{ backgroundColor: "#66cdaa" }} label={location.status} />
                    <Typography variant="subtitle2">
                      <Box fontStyle="italic" paddingTop={1} fontWeight="fontWeightLight">
                        {location.address}
                      </Box>
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" href={getViewUrl(location)}>
                      View
                    </Button>
                    <Button size="small" color="primary" href={getDirectionsUrl(location)}>
                      Directions
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
      {/* Footer */}
      <footer className={classes.footer}>
        <Grid container justify="center">
          <Grid item>
            <Link color="inherit" href="https://github.com/">
              <GitHubIcon className={classes.icon} />
            </Link>
          </Grid>
        </Grid>
        <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
          <Link color="inherit" href="https://covid-global-hackathon.devpost.com/">
            #BuildforCOVID19 Global Online Hackathon
          </Link>
        </Typography>
        <Copyright />
      </footer>
      {/* End footer */}
    </React.Fragment>
  );
}