# React-Reach

React Fetch package for handling api calls, access and errors from servers.

Support Basic and Bearer atm. With Bearer token you also have to provide refreshToken on timeouts.

## Provider

```
export interface ReachProviderValues {
    url: string;
    headers: HttpHeaders;
    opts: {
        type: 'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded';
        noJson: boolean;
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        auth: boolean;
        filesKeys: string[];
        body: IBody; // [key: string]: any
        query: IQuery; // [key: string]: string
        headers: HttpHeaders;
        tokenInBody: boolean;
    };
    authorization: {
        endPoint: string;
        type: 'Basic' | 'Bearer';
        token: string;
        refreshToken: string;
        refreshingToken: boolean; // Should not be used.
    };
    StatusWrapper: ({ busy }: { busy: boolean } & JSX.ElementChildrenAttribute) => any;
    EmptyState: () => JSX.Element;
    BusyState: () => JSX.Element;
    ErrorState: ({ error }: { error: ReachError }) => JSX.Element;
}

interface ReachError {
  code: number;
  message: string;
  details?: Response;
}
```

### Good to know

#### HTTPHeaders

Should be a object of { [key: string]: any } or created with "new Headers()"  
"headers" and "opts.headers" is combined in that order.

#### opts.body

Will tack on values as query if method is 'GET'
const query = {
...opts.body,
...opts.query
}

#### opts.tokenInBody

Token is provided default as a query param. Set this to true if you want to provide it in the body.

### Error Handling

#### StatusWrapper

Wraps around the busyState or data on refreshing.  
Recommended is just a pulsating white overlay.

#### EmptyState

If server returns null or empty array.

#### BusyState

This will show while fetching from server.  
This can be disabled in ReachResource if desirable.

#### ErrorState

```
interface ReachError {
  code: number;
  message: string;
  details?: Response;
}
```

If server return anything equals or over 400.  
This component should handle all errors. And recommended to have a popup modal that shows the error.  
You should logg out the user if it return 401 or 403.  
You can have a more default error handling by using the details which is the response from server.

## React usage

### Provider

```
const EmptyState = () => <>Fant ikke resurs</>;
const BusyState = () => <>Laster...</>;
const ErrorState = ({ error }) => (
  <>
    FEIL!: {error.code} : {error.message}
  </>
);

addDecorator(story => (
  <ReachProvider
    url="https://jsonplaceholder.typicode.com"
    headers={...}
    authorization={...}
    opts={...}
    EmptyState={EmptyState}
    BusyState={BusyState}
    ErrorState={ErrorState}
  >
    {story()}
  </ReachProvider>
));
```

### ReachResource

React component for easily fetching data from server with predefined component states.

You also have a ReachResourceContext that can be used if you want to have a Provider and Consumer to use further down the React tree.

```
import { ReachResourceContext } from '@ludens-reklame/react-reach';

interface Response {
    id: string;
    title: string
}

const ResponseResource = new ResourceProvider<Response>();
const ResponseResourceConsumer = UnitResource.Consumer;
const ResponseResourceProvider = UnitResource.Provider;

export {
    ResponseResourceConsumer,
    ResponseResourceProvider
}
```

#### Simple fetch

```
import { ReachResource } from '@ludens-reklame/react-reach';

interface Response {
    id: string;
    title: string
}
<ReachResource<Response[]> endpoint="todos">
    {({ data }) => (
      <>
        {(data || []).map(x => (
          <div>
            {x.id} : {x.title}
          </div>
        ))}
      </>
    )}
</ReachResource>
```

#### Advanced fetch

Lets say we have two different endpoint for the post and comments of that post  
We can make these call at the same time. With no EmptyState and noBusyState.  
We can check busy property if we want to render some animation of the update.

```
<ReachResource<Array<{ id: string; title: string }>, Array<{ id: string, body: string }>>
    endpoint="posts"
    params={ { id: 1 } }
    noEmptyState
    noBusyState
    secondaryEndpoint="comments"
    secondaryParams={ { postId: 1 } }
  >
    { ({ data, secondaryData, refresh, busy }) => (
      <>
        { busy ? 'Updating' : '' }
        <h1>Posts</h1>
        {(data || []).map(x => (
          <div>
            {x.id} : {x.title}
          </div>
        ))}
        <h2>Comments</h2>
        { (secondaryData || []).map( comment => (
          <div>
            { comment.id } : { comment.body }
          </div>
        ) ) }
        <button onClick={ () => refresh() }>Refresh</button>
      </>
    )}
  </ReachResource>
```

#### putField

If you want to update a field in the response from server.

This will update the first element with the new values. and rerender ReachResource.

```
const replaceObject = {
    _id: 1,
    name: 'replace name'
}

const response = [
    {
        _id: 1,
        name: 'name'
    },
    {
        _id: 2,
        name: 'name 2'
    },
    {
        _id: 3,
        name: 'name 3'
    }
]

putField([], replaceObject)
```

Lets say you have a object as a response. You can provide the field you want to check with an array.

```
const secondResponse = {
    field: response // Response is the same
}

putField(['field'], replaceObject)
```

You can go as far down as you want with this array. Just keep in mind it can be very expensive with allot of data.
