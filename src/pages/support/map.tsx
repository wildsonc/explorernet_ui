import {
  ActionIcon,
  Autocomplete,
  Badge,
  Drawer,
  Group,
  Loader,
  Notification,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { ExtendedFeature } from "d3-geo";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  CircleLayer,
  FillLayer,
  FullscreenControl,
  Layer,
  LineLayer,
  Map,
  MapLayerMouseEvent,
  MapRef,
  NavigationControl,
  Source,
} from "react-map-gl";
import { useQuery } from "react-query";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import {
  AlertTriangle,
  History,
  Phone,
  Search,
  User,
  X,
} from "tabler-icons-react";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import Legend from "../../components/Map/Legend";
import Tooltip from "../../components/Map/Tooltip";
import DrawerActiveContent from "../../components/NOC/DrawerActiveContent";
import DrawerContent from "../../components/NOC/DrawerContent";
import api from "../../services/api";
import hasPermission from "../../services/utils/hasPermission";
import { showNotification } from "@mantine/notifications";
import { useClipboard } from "@mantine/hooks";

interface ITooltip {
  x: number;
  y: number;
  feature: {
    properties: {
      phone: string;
      username: string;
      company: string;
    };
  };
}

interface ICategory {
  [key: string]: {
    enabled: boolean;
    color?: string;
  };
}

const color = {
  Online: "blue",
  Offline: "red",
  Reduzido: "Orange",
};

export default function Mapa() {
  const { colorScheme } = useMantineColorScheme();
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [drawerActiveOpened, setDrawerActiveOpened] = useState(false);
  const [categories, setCategories] = useState<ICategory>();
  const [hoverInfo, setHoverInfo] = useState<ITooltip>();
  const [username, setUsername] = useState("");
  const [debouncedUsername] = useDebouncedValue(username, 200);
  const { accessTokenPayload } = useSessionContext();
  const clipboard = useClipboard({ timeout: 500 });
  const mapRef = useRef<MapRef>();

  const { isLoading, isError, isFetching, data, error } = useQuery<
    ExtendedFeature[],
    Error
  >(
    "point-data",
    async () => {
      const response = await api.get(`api/support/map`);
      return response.data;
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const { data: NotificationArea, refetch } = useQuery<
    ExtendedFeature[],
    Error
  >(
    "area-data",
    async () => {
      const response = await api.get(`api/noc/notification?geojson=true`);
      return response.data;
    },
    {
      staleTime: 1000 * 10, // 1 minute
    }
  );

  const onClick = async (event: MapLayerMouseEvent) => {
    const feature = event?.features;
    if (feature && feature[0].layer.id == "point") {
      clipboard.copy(feature[0].properties?.username);
      showNotification({
        message: "Username copiado!",
        color: "green",
      });
    }
  };

  const onHover = useCallback((event) => {
    if (event.features[0].layer.id == "point") {
      const {
        features,
        point: { x, y },
      } = event;
      const hoveredFeature = features && features[0];

      setHoverInfo(hoveredFeature && { feature: hoveredFeature, x, y });
    }
  }, []);

  const dark = colorScheme === "dark";

  const pointLayer: CircleLayer = {
    id: "point",
    type: "circle",
    paint: {
      "circle-radius": {
        base: 1.5,
        stops: [
          [5, 0.5],
          [9, 0.8],
          [12, 1.3],
          [22, 60],
          [30, 80],
        ],
      },
      "circle-color": [
        "match",
        ["get", "status"],
        "Online",
        color["Online"],
        "Offline",
        color["Offline"],
        "Reduzido",
        color["Reduzido"],
        /* other */ "#ccc",
      ],
    },
  };

  const fillLayer: FillLayer = {
    id: "area",
    type: "fill",
    paint: {
      "fill-outline-color": "red",
      "fill-color": "red",
      "fill-opacity": 0.1,
    },
  };

  const lineLayer: LineLayer = {
    id: "outline",
    type: "line",
    paint: {
      "line-width": 1,
      "line-color": "red",
    },
  };

  const dataMap = useMemo(() => {
    if (categories && data) {
      //@ts-ignore
      const filterData = data.features.filter((e: any) => {
        return categories[e.properties.status].enabled;
      });
      return {
        type: "FeatureCollection",
        features: filterData,
      };
    }
    return data;
  }, [categories, data]);

  function get_categories() {
    if (data) {
      const unique: any = [
        //@ts-ignore
        ...new Set(
          //@ts-ignore
          data.features.map((item) => item.properties.status)
        ),
      ];
      let newCategories: ICategory = {};
      unique.map((e: string) => {
        //@ts-ignore
        newCategories[e] = { enabled: true, color: color[e] };
        if (categories && categories[e] !== undefined) {
          newCategories[e].enabled = categories[e]
            ? categories[e].enabled
            : true;
        }
      });
      setCategories(newCategories);
    }
  }
  // set categories
  useMemo(() => get_categories(), [data]);

  const SearchUser = useMemo(() => {
    if (debouncedUsername && data) {
      //@ts-ignore
      let users = data.features.filter((e) =>
        e.properties?.username?.includes(debouncedUsername)
      );
      users = users.slice(0, 5);
      const result: any = [];
      users.map((e: any) => {
        const obj = {
          value: e.properties.username,
          coordinates: e.geometry.coordinates,
        };
        result.push(obj);
      });
      return result;
    }
  }, [debouncedUsername, data]);

  const Fly = (coordinates: [number, number]) => {
    mapRef.current?.flyTo({
      center: coordinates,
      zoom: 20,
      essential: true,
    });
  };

  const roles = accessTokenPayload.roles;

  if (!hasPermission("view_support", roles)) {
    return <NotAuthorized />;
  }

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <Map
          preserveDrawingBuffer
          // @ts-ignore
          ref={mapRef}
          id="nocMap"
          onClick={onClick}
          onMouseMove={onHover}
          onMouseLeave={() => setHoverInfo(undefined)}
          interactiveLayerIds={["area", "point"]}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle={
            dark
              ? "mapbox://styles/mapbox/dark-v10"
              : "mapbox://styles/mapbox/streets-v11"
          }
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 5,
          }}
          // interactiveLayerIds={['point']}
          initialViewState={{
            longitude: -48.5038567,
            latitude: -16.0768232,
            zoom: 13,
          }}
        >
          {NotificationArea && (
            <Source
              id="area-data"
              type="geojson"
              //  @ts-ignore-next-line
              data={NotificationArea}
            >
              <Layer {...fillLayer} />
              <Layer {...lineLayer} />
            </Source>
          )}
          {data && (
            //  @ts-ignore-next-line
            <Source id="map-data" type="geojson" data={dataMap}>
              <Layer {...pointLayer} />
            </Source>
          )}
          <FullscreenControl position="top-left" />
          <NavigationControl position="top-left" />
          {hoverInfo && (
            <Tooltip x={hoverInfo.x + 15} y={hoverInfo.y - 30}>
              <Group>
                <User size={16} style={{ marginRight: -10 }} />
                {hoverInfo.feature.properties.username}
              </Group>
              <Group>
                <Phone size={16} style={{ marginRight: -10 }} />
                {hoverInfo.feature.properties.phone}
              </Group>
              <Group position="center">
                <Badge
                  my={5}
                  color={
                    hoverInfo.feature.properties.company == "explorernet"
                      ? "orange"
                      : "pink"
                  }
                >
                  {hoverInfo.feature.properties.company}
                </Badge>
              </Group>
            </Tooltip>
          )}

          <Autocomplete
            onChange={setUsername}
            value={username}
            data={SearchUser ? SearchUser : []}
            onItemSubmit={(e) => Fly(e.coordinates)}
            icon={<Search size={14} />}
            placeholder="username"
            sx={{
              position: "absolute",
              top: 10,
              left: 50,
              borderRadius: 5,
              minWidth: 260,
            }}
          />
          <ActionIcon
            sx={{
              position: "absolute",
              bottom: 30,
              right: 10,
            }}
            size="xl"
            radius="xl"
            variant="filled"
            color="blue"
            onClick={() => setDrawerOpened(true)}
          >
            <History />
          </ActionIcon>
          <ActionIcon
            sx={{
              position: "absolute",
              bottom: 80,
              right: 10,
            }}
            size="xl"
            radius="xl"
            variant="filled"
            color="yellow"
            onClick={() => setDrawerActiveOpened(true)}
          >
            <AlertTriangle />
          </ActionIcon>
        </Map>
        {isError && (
          <Notification
            icon={<X size={18} />}
            color="red"
            sx={{
              position: "absolute",
              bottom: 10,
              right: 10,
              zIndex: 10,
            }}
          >
            {error.message}
          </Notification>
        )}
        {(isLoading || isFetching) && (
          <Loader
            size="lg"
            sx={{
              position: "absolute",
              zIndex: 10,
              top: "50%",
              left: "50%",
              transform: "translate(50%, -50%)",
            }}
          />
        )}
        {categories && (
          <Legend categories={categories} setCategories={setCategories} />
        )}
      </div>
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        overlayOpacity={0.4}
        position="right"
        title={<Title>Histórico</Title>}
        padding="xl"
        size="md"
      >
        <DrawerContent mapRef={mapRef.current} />
      </Drawer>
      <Drawer
        opened={drawerActiveOpened}
        onClose={() => setDrawerActiveOpened(false)}
        overlayOpacity={0.4}
        position="right"
        title={<Title>Ativos</Title>}
        padding="xl"
        size="md"
      >
        <DrawerActiveContent mapRef={mapRef.current} />
      </Drawer>
    </>
  );
}
