import { HomeState } from '@angular-ngrx-nx/home/src/+state/home.interfaces';
import { HomeService } from '@angular-ngrx-nx/home/src/home.service';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { switchMap } from 'rxjs/operators/switchMap';
import { withLatestFrom } from 'rxjs/operators/withLatestFrom';

import { LoadArticles, LoadTags, Favorite, SetListType, SetListPage, SetListTag } from './home.actions';
import * as fromHome from './home.reducer';

@Injectable()
export class HomeEffects {
  @Effect()
  setListType = this.actions
    .ofType<SetListType>('[home] SET_LIST_TYPE')
    .pipe(map(() => ({ type: '[home] LOAD_ARTICLES' })));

  @Effect()
  setListPage = this.actions
    .ofType<SetListPage>('[home] SET_LIST_PAGE')
    .pipe(map(() => ({ type: '[home] LOAD_ARTICLES' })));

  @Effect()
  setListTag = this.actions
    .ofType<SetListTag>('[home] SET_LIST_TAG')
    .pipe(map(() => ({ type: '[home] LOAD_ARTICLES' })));

  @Effect()
  loadArticles = this.actions.ofType<LoadArticles>('[home] LOAD_ARTICLES').pipe(
    withLatestFrom(this.store.select(fromHome.getListConfig)),
    switchMap(([_, config]) =>
      this.homeService.query(config).pipe(
        map(results => ({
          type: '[home] LOAD_ARTICLES_SUCCESS',
          payload: { articles: results.articles, articlesCount: results.articlesCount }
        })),
        catchError(error =>
          of({
            type: '[home] LOAD_ARTICLES_FAIL',
            payload: error
          })
        )
      )
    )
  );

  @Effect()
  loadTags = this.actions.ofType<LoadTags>('[home] LOAD_TAGS').pipe(
    switchMap(() =>
      this.homeService.getTags().pipe(
        map(results => ({
          type: '[home] LOAD_TAGS_SUCCESS',
          payload: results.tags
        })),
        catchError(error =>
          of({
            type: '[home] LOAD_TAGS_FAIL',
            payload: error
          })
        )
      )
    )
  );

  @Effect()
  favorite = this.actions.ofType<Favorite>('[home] FAVORITE').pipe(
    map(action => action.payload),
    switchMap(slug =>
      this.homeService.favorite(slug).pipe(
        map(results => ({
          type: '[home] FAVORITE_SUCCESS',
          payload: results
        })),
        catchError(error =>
          of({
            type: '[home] FAVORITE_FAIL',
            payload: error
          })
        )
      )
    )
  );

  @Effect()
  unFavorite = this.actions.ofType<Favorite>('[home] UNFAVORITE').pipe(
    map(action => action.payload),
    switchMap(slug =>
      this.homeService.unfavorite(slug).pipe(
        map(results => ({
          type: '[home] UNFAVORITE_SUCCESS',
          payload: results
        })),
        catchError(error =>
          of({
            type: '[home] UNFAVORITE_FAIL',
            payload: error
          })
        )
      )
    )
  );

  constructor(private actions: Actions, private store: Store<HomeState>, private homeService: HomeService) {}
}
