import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Option, Schema } from "effect";

import type { URLHelpers } from "@/lib/url-sync";
import { defaultURLHelpers } from "@/lib/url-sync";
import { FilterSchema } from "@/schemas/model";
import type { State } from "@/store/store";
import { userStateSlice } from "@/store/user-state-slice";

export const useUrlSync = (urlHelpers: URLHelpers = defaultURLHelpers) => {
  const dispatch = useDispatch();
  const filter = useSelector((state: State) => state.userState.filter);

  useEffect(() => {
    const syncURL = () => {
      const filterParam = urlHelpers.getSearchParam("filter");
      const validatedFilter =
        Schema.decodeUnknownOption(FilterSchema)(filterParam);

      if (Option.isSome(validatedFilter) && validatedFilter.value !== filter) {
        dispatch(userStateSlice.actions.setFilter(validatedFilter.value));
      }
    };

    syncURL();
    window.addEventListener("popstate", syncURL);

    return () => {
      window.removeEventListener("popstate", syncURL);
    };
  }, [dispatch, urlHelpers, filter]);
};
