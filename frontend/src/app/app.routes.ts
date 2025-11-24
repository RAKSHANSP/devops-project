import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Signup } from './signup/signup';
import { Login} from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Weather } from './weather/weather';
import { ProductComponent } from './product/product';
import { DealerMarket } from './dealer-market/dealer-market';
import { InformationSharing } from './information-sharing/information-sharing';
import { GovtOfficial } from './govt-official/govt-official';
import { IndividualChat } from './individual-chat/individual-chat';
import { GroupChat } from './group-chat/group-chat';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'signup', component: Signup },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'weather', component: Weather},
  { path: 'products', component: ProductComponent },
  { path: 'dealer-market', component: DealerMarket },
  { path: 'information-sharing', component: InformationSharing },
  { path: 'govt-official', component: GovtOfficial },
  { path: 'individual-chat', component: IndividualChat},
  { path: 'group-chat', component: GroupChat},
];