import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Table, Card, Image } from 'antd';
import axios from 'axios';
import { getFlagCode } from '../helpers';
import Flag from 'react-flagkit';
import { getPositionColor } from '../helpers';
import Breadcrumbs from './Breadcrumb';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Flex, Tooltip } from 'antd';
import F1Loader from './F1Loader';

const Driver = (props) => {
  const [driverDetails, setDriverDetails] = useState({});
  const [driverRaces, setDriverRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const { driverId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const driverDetailsResponse = await axios.get(
          `https://ergast.com/api/f1/2013/drivers/${driverId}/driverStandings.json`
        );
        const driverRacesResponse = await axios.get(
          `https://ergast.com/api/f1/2013/drivers/${driverId}/results.json`
        );

        setDriverDetails(
          driverDetailsResponse.data.MRData.StandingsTable.StandingsLists[0]
            .DriverStandings[0]
        );
        setDriverRaces(driverRacesResponse.data.MRData.RaceTable.Races);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [driverId]);

  if (loading) {
    return <F1Loader />;
  }

  const breadcrumbs = [
    { label: 'Home' },
    { label: 'Drivers', link: '/drivers' },
    { label: `${driverDetails.Driver.familyName}` },
  ];

  console.log('zastava log', driverDetails);

  return (
    <div>
      <div className='bred-div'>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      <div className='driver-container'>
        <Card title={<span style={{ color: "rgb(255, 255, 255)" }}>Driver Details</span>}
        className='driver-details-card white-text' style={{marginTop: "20px"}}>
          <Image
            src={`${
              process.env.PUBLIC_URL
            }/img/${driverDetails.Driver.familyName.toLowerCase()}.jpg`}
          />

          <Flag
            size={50}
            country={`${getFlagCode(
              props.flags,
              driverDetails.Driver.nationality
            )}`}
          />
          <p>
            Name: {driverDetails.Driver.givenName}{' '}
            {driverDetails.Driver.familyName}
          </p>
          <p>Team: {driverDetails.Constructors[0].name}</p>
          <p>Birth: {driverDetails.Driver.dateOfBirth}</p>
          <p>
            <Flex gap='small' vertical>
              <Flex wrap gap='small'>
                <Button type='primary' icon={<SearchOutlined />}>
                  <a href={driverDetails.Driver.url} target='blank'>
                    Biography
                  </a>
                </Button>
              </Flex>
            </Flex>
          </p>
        </Card>

        <div className='driver-table'>
          <Table
            style={{marginTop: "20px"}}
           rowClassName={(record, index) => index % 2 === 0 ? 'odd-row' : ''}
            dataSource={driverRaces.map((race) => ({
              key: race.round,
              round: race.round,
              race: race.raceName,
              grandPrix: (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Flag
                    size={50}
                    country={`${getFlagCode(
                      props.flags,
                      race.Circuit.Location.country
                    )}`}
                    style={{ marginRight: '5px' }}
                  />
                  {race.raceName}
                </div>
              ),
              team: race.Results[0].Constructor.name,
              grid: race.Results[0].grid,
              racePosition: race.Results[0].position,
            }))}
            columns={[
              { title: 'Round', dataIndex: 'round', key: 'round' },
              {
                title: 'Grand Prix',
                dataIndex: 'grandPrix',
                key: 'grandPrix',
                filters: [
                  ...driverRaces.map((race, i) => {
                    // Spread Operator - za prikaz elemenata objekta (u suprotnom se prikazuje ceo objekat)
                    return {
                      text: `${race.raceName}`,
                      value: `${race.raceName}`,
                    };
                  }),
                ],
                filterMode: 'tree',
                filterSearch: true,
                onFilter: (value, record) => record.race.includes(value), // setujemo record.name
                width: '30%',
              },
              { title: 'Team', dataIndex: 'team', key: 'team' }, // jedan tim je po sezoni, ne treba filter
              { title: 'Grid', dataIndex: 'grid', key: 'grid' },
              {
                title: 'Race Position',
                dataIndex: 'racePosition',
                key: 'racePosition',
                sorter: (a, b) => a.racePosition - b.racePosition,
                render: (text) => (
                  <div
                    className='color'
                    style={{ backgroundColor: getPositionColor(text) }} 
                  >
                    {text}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Driver;
