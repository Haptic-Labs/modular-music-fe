import { Wordmark } from "../assets";

export const Header = () => {
  return (
    <nav
      css={(theme) => ({
        display: "flex",
        width: "100%",
        height: 60,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        backgroundColor: theme.colors.grayDark.gray1,
      })}
    >
      <Wordmark
        variant="dark"
        css={{
          height: "80%",
          width: "auto",
        }}
      />
    </nav>
  );
};
