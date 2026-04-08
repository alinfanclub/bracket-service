import { Module } from "@nestjs/common";

import { PrismaModule } from "./common/prisma.module";
import { AthletesModule } from "./modules/athletes/athletes.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BracketsModule } from "./modules/brackets/brackets.module";
import { MatchesModule } from "./modules/matches/matches.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { ShareLinksModule } from "./modules/share-links/share-links.module";
import { TournamentsModule } from "./modules/tournaments/tournaments.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, OrganizationsModule, AthletesModule, TournamentsModule, BracketsModule, MatchesModule, ShareLinksModule]
})
export class AppModule {}
