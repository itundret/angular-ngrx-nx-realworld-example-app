import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthState, User } from '@angular-ngrx-nx/auth/src/+state/auth.interfaces';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Profile, ProfileState } from '@angular-ngrx-nx/profile/src/+state/profile.interfaces';
import * as fromProfile from './+state/profile.reducer';
import * as fromAuth from '@angular-ngrx-nx/auth/src/+state/auth.reducer';
import { Subject } from 'rxjs/Subject';
import { combineLatest } from 'rxjs/operators/combineLatest';
import { map } from 'rxjs/operators/map';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { tap } from 'rxjs/operators/tap';

@Component({
	selector: 'profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
	profile$: Observable<Profile>;
	currentUser$: Observable<User>;
	isUser$: Subject<boolean> = new Subject();
	unsubscribe$: Subject<void> = new Subject();
	following: boolean;
	username: string;

	constructor(private store: Store<ProfileState | AuthState>) { }

	ngOnInit() {
		this.profile$ = this.store.select(fromProfile.getProfile);
		this.currentUser$ = this.store.select(fromAuth.getUser);

		this.profile$
			.pipe(
			combineLatest(this.currentUser$),
			tap(([p, u]) => {
				this.username = p.username;
				this.following = p.following
			}),
			map(([p, u]) => p.username === u.username),
			takeUntil(this.unsubscribe$))
			.subscribe(isUser => this.isUser$.next(isUser));
	}

	toggleFollowing() {
		if (this.following) {
			this.store.dispatch({
				type: '[profile] UNFOLLOW',
				payload: this.username
			})
		} else {
			this.store.dispatch({
				type: '[profile] FOLLOW',
				payload: this.username
			})
		}
	}

	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
