/* eslint-disable react-refresh/only-export-components */
import { RouteObject } from "react-router-dom";
import { AppLayout } from ".";
import { HomePage, PageNotFound } from "../pages";
import { AuthPage } from "../pages/auth";

export const TOP_LEVEL_ROUTES: RouteObject[] = [
  {
    index: true,
    element: <HomePage />,
    id: "Home",
  },
  {
    path: "/modules",
    element: <PageNotFound />,
    id: "Modules",
  },
] as const;

export const ROUTES: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: TOP_LEVEL_ROUTES,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
] as const;
