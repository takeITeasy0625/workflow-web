import VueRouter, {Route} from 'vue-router'
import {Store} from 'vuex'
import Utils from '@/utils/utils'

declare module 'vue/types/vue' {


    interface Vue {
        $router: VueRouter;

        $route: Route;

        $store: Store<any>;

        $mock: any;

        $configs: any;

		$bus: Vue;

		$utils: Utils;
    }
}
