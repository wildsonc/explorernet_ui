import { Box, useMantineColorScheme } from "@mantine/core";

interface Props {
  link: string;
  dashboard?: boolean;
  titled?: boolean;
  displayWaterMark?: boolean;
}

function Metabase({ link, dashboard, titled, displayWaterMark }: Props) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const theme = dark ? "&theme=night" : "";
  const title = titled ? "&titled=true" : "&titled=false";

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          borderRadius: 5,
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            position: "absolute",
            top: -2,
            left: -2,
          }}
        >
          {!displayWaterMark && (
            <Box
              sx={(theme) => ({
                position: "absolute",
                bottom: 5,
                left: 5,
                background: theme.colorScheme == "dark" ? "#2d353a" : "white",
                width: 300,
                height: 39,

                "@media (max-width: 1211px)": {
                  bottom: 0,
                },
              })}
            />
          )}
          <iframe
            src={link + title + theme}
            frameBorder={0}
            width={dashboard ? "100.5%" : "101%"}
            height={dashboard ? "100.5%" : "101%"}
          />
        </Box>
      </Box>
    </>
  );
}

export default Metabase;
