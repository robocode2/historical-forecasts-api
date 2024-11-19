import { BindingKey } from "@loopback/core";
import { DataService } from "./DataService";

export namespace Util {
    export namespace Service {
      export const DATA = BindingKey.create<DataService>('util.services.data');
    }
}