import {
  ActionIcon,
  Autocomplete,
  Badge,
  Button,
  Drawer,
  Group,
  Loader,
  Modal,
  MultiSelect,
  Select,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { ExtendedFeature, GeoGeometryObjects } from "d3-geo";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useMemo, useRef, useState } from "react";
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
  Filter,
  License,
  Phone,
  Search,
  User,
  History,
} from "tabler-icons-react";
import DrawControl from "../../components/Controls/draw-control";
import NotAuthorized from "../../components/ErrorPage/NotAuthorized";
import Legend from "../../components/Map/Legend";
import Tooltip from "../../components/Map/Tooltip";
import AreaControl from "../../components/Marketing/AreaControl";
import api from "../../services/api";
import hasPermission from "../../services/utils/hasPermission";
import { useForm } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import AreaModal from "../../components/Marketing/AreaModal";
import DrawerContent from "../../components/Marketing/DrawerContent";

interface Category {
  [key: string]: {
    enabled: boolean;
    color?: string;
  };
}

interface ITooltip {
  x: number;
  y: number;
  feature: {
    properties: {
      phone: string;
      name: string;
      company: string;
      access_plan: string;
    };
  };
}

interface IFilter {
  plans: string[];
  company?: string;
}

const color = {
  Online: "green",
  Offline: "red",
  Bloqueado: "orange",
  Reduzido: "orange",
  Cancelado: "gray",
};

const MapMarketing = () => {
  const { accessTokenPayload } = useSessionContext();
  const { colorScheme } = useMantineColorScheme();
  const [polygon, setPolygon] = useState<GeoGeometryObjects>();
  const [categories, setCategories] = useState<Category>();
  const [hoverInfo, setHoverInfo] = useState<ITooltip>();
  const [accessPlans, setAccessPlans] = useState<string[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [coordinate, setCoordinate] = useState("");
  const [openedFilter, setOpenedFilter] = useState(false);
  const [opened, setOpened] = useState(false);
  const [areaSelected, setAreaSelected] = useState();
  const [drawerOpened, setDrawerOpened] = useState(false);
  const mapRef = useRef<MapRef>();
  const clipboard = useClipboard({ timeout: 500 });
  const [filter, setFilter] = useState<IFilter>({
    plans: [""],
    company: "Todas",
  });
  const form = useForm({
    initialValues: {
      company: "Todas",
    },
  });

  const { isLoading, isFetching, data } = useQuery<ExtendedFeature[], Error>(
    "marketing-point-data",
    async () => {
      const response = await api.get(`api/marketing/map`);
      return response.data;
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const { data: CampaignArea, refetch } = useQuery<ExtendedFeature[], Error>(
    "marketing-area-data",
    async () => {
      const response = await api.get(`api/marketing/campaign?geojson=true`);
      return response.data;
    },
    {
      staleTime: 1000 * 10, // 1 minute
    }
  );

  const roles = accessTokenPayload.roles;

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
        "Bloqueado",
        color["Bloqueado"],
        "Reduzido",
        color["Reduzido"],
        "Cancelado",
        color["Cancelado"],
        /* other */ "#ccc",
      ],
    },
  };

  const fillLayer: FillLayer = {
    id: "area",
    type: "fill",
    paint: {
      "fill-outline-color": ["get", "color"],
      "fill-color": ["get", "color"],
      "fill-opacity": 0.1,
    },
  };

  const lineLayer: LineLayer = {
    id: "outline",
    type: "line",
    paint: {
      "line-width": 1,
      "line-color": ["get", "color"],
    },
  };

  const onUpdate = useCallback((e) => {
    setPolygon((currFeatures) => {
      const newFeatures: any = { ...currFeatures };
      for (const f of e.features) {
        newFeatures[f.id] = f;
      }
      return newFeatures;
    });
  }, []);

  const onDelete = useCallback((e) => {
    setPolygon((currFeatures) => {
      const newFeatures: any = { ...currFeatures };
      for (const f of e.features) {
        delete newFeatures[f.id];
      }
      return newFeatures;
    });
  }, []);

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

  const onClick = async (event: MapLayerMouseEvent) => {
    const feature = event?.features;
    if (feature && feature[0].layer.id == "area") {
      api
        .get(`api/marketing/campaign/${feature[0].id}`)
        .then((response) => setAreaSelected(response.data))
        .then(() => setOpened(true));
    } else if (feature && feature[0].layer.id == "point") {
      clipboard.copy(feature[0].properties?.name);
      showNotification({
        message: "Nome copiado!",
        color: "green",
      });
    }
  };

  //Filter
  const dataMap = useMemo(() => {
    if (categories && data) {
      //@ts-ignore
      const filterData = data.features.filter((e: any) => {
        const status = categories[e.properties.status].enabled;
        let access_plan = true;
        let company = true;

        if (filter.plans[0] != undefined && filter.plans[0] != "") {
          access_plan = filter.plans.includes(e.properties.access_plan);
        }

        if (form.values.company != "Todas") {
          company = e.properties.company == form.values.company;
        }
        return access_plan && status && company;
      });
      return {
        type: "FeatureCollection",
        features: filterData,
      };
    }
    return data;
  }, [categories, data, filter]);

  function get_categories() {
    if (data) {
      const unique: any = [
        //@ts-ignore
        ...new Set(
          //@ts-ignore
          data.features.map((item) => item.properties.status)
        ),
      ];
      let newCategories: Category = {};
      unique.map((e: string) => {
        newCategories[e] = {
          enabled: e != "Reduzido" ? true : false,
          //@ts-ignore
          color: color[e],
        };
        if (categories && categories[e] !== undefined) {
          newCategories[e].enabled = categories[e]
            ? categories[e].enabled
            : true;
        }
      });
      setCategories(newCategories);
      get_plans();
    }
  }

  function get_plans() {
    if (!data) return;
    const unique: any = [
      //@ts-ignore
      ...new Set(
        //@ts-ignore
        data.features.map((item) => item.properties.access_plan)
      ),
    ];
    setAccessPlans(unique);
  }
  // set categories
  useMemo(() => get_categories(), [data]);

  const updateFilter = () => {
    setFilter({ plans: selectedPlans, company: form.values.company });
    setOpenedFilter(false);
  };
  const clearFilter = () => {
    setSelectedPlans([]);
    form.reset();
    setFilter({ plans: [], company: "Todas" });
    setOpenedFilter(false);
  };

  const Fly = (coordinates: [number, number]) => {
    mapRef.current?.flyTo({
      center: coordinates,
      zoom: 20,
      essential: true,
    });
  };

  if (!hasPermission("view_marketing", roles)) {
    return <NotAuthorized />;
  }

  return (
    <>
      <Map
        preserveDrawingBuffer
        // @ts-ignore
        ref={mapRef}
        onMouseMove={onHover}
        onMouseLeave={() => setHoverInfo(undefined)}
        onClick={onClick}
        interactiveLayerIds={data ? ["point", "area"] : []}
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
        initialViewState={{
          longitude: -48.97148,
          latitude: -16.32878,
          zoom: 12,
        }}
      >
        {CampaignArea && (
          <Source
            id="area-data"
            type="geojson"
            //  @ts-ignore-next-line
            data={CampaignArea}
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
        <DrawControl
          position="top-left"
          displayControlsDefault={false}
          controls={{
            polygon: true,
            trash: true,
          }}
          onCreate={onUpdate}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
        <NavigationControl position="top-left" />
        <Autocomplete
          icon={<Search size={14} />}
          onChange={setCoordinate}
          value={coordinate}
          data={[coordinate]}
          onItemSubmit={(e) => {
            const c = e.value.split(",");
            try {
              const lat = Number(c[0]);
              const lon = Number(c[1]);
              Fly([lon, lat]);
            } catch {
              showNotification({
                title: "Localização inválida",
                message: "Exemplo: -16.31809,-48.96837",
                color: "red",
              });
            }
          }}
          placeholder="Coordenadas"
          sx={{
            position: "absolute",
            top: 10,
            left: 50,
            borderRadius: 5,
            minWidth: 200,
          }}
        />
        {categories && (
          <>
            <Legend categories={categories} setCategories={setCategories} />
            <Button
              sx={{
                borderRadius: 5,
                padding: 5,
                boxShadow: "0 0 0 2px rgb(0 0 0 / 10%)",
                position: "absolute",
                top: 110,
                right: 10,
                minWidth: 125,
              }}
              onClick={() => setOpenedFilter(true)}
              leftIcon={<Filter size={18} />}
            >
              Mais filtros
            </Button>
          </>
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
        <AreaControl dataMap={dataMap} polygon={polygon} refetch={refetch} />
        {hoverInfo && (
          <Tooltip x={hoverInfo.x + 15} y={hoverInfo.y - 30}>
            <Group>
              <User size={16} style={{ marginRight: -10 }} />
              {hoverInfo.feature.properties.name}
            </Group>
            <Group>
              <Phone size={16} style={{ marginRight: -10 }} />
              {hoverInfo.feature.properties.phone}
            </Group>
            <Group noWrap>
              <License size={16} style={{ marginRight: -10 }} />
              {hoverInfo.feature.properties.access_plan}
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
      </Map>
      <Modal
        title={<strong>Filtrar</strong>}
        opened={openedFilter}
        onClose={() => setOpenedFilter(false)}
      >
        <MultiSelect
          data={accessPlans}
          label="Planos"
          placeholder="Escolha"
          value={selectedPlans}
          onChange={setSelectedPlans}
          searchable
        />
        <Select
          data={["Todas", "explorernet", "internetup"]}
          label="Empresa"
          placeholder="Escolha"
          {...form.getInputProps("company")}
          searchable
        />
        <Group mt={20} grow>
          <Button color="gray" variant="outline" onClick={clearFilter}>
            Limpar
          </Button>
          <Button onClick={updateFilter}>Aplicar</Button>
        </Group>
      </Modal>
      {areaSelected && (
        <AreaModal
          onClose={setOpened}
          open={opened}
          data={areaSelected}
          refetch={refetch}
        />
      )}
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
    </>
  );
};

export default MapMarketing;
