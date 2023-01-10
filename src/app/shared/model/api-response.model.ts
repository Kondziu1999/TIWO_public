export interface ApiResponse<ResponseType> {
    response: ResponseType;
    successful: boolean;
    errorMessage: string;
}